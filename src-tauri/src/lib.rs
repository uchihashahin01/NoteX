use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconEvent,
    Manager,
};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileNode>>,
}

fn get_notes_dir() -> PathBuf {
    let home = std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    let notes_dir = home.join("NoteX");
    if !notes_dir.exists() {
        fs::create_dir_all(&notes_dir).ok();
    }
    notes_dir
}

fn build_file_tree(dir: &Path) -> Vec<FileNode> {
    let mut nodes: Vec<FileNode> = Vec::new();

    if let Ok(entries) = fs::read_dir(dir) {
        let mut entries: Vec<_> = entries.filter_map(|e| e.ok()).collect();
        entries.sort_by(|a, b| {
            let a_is_dir = a.file_type().map(|t| t.is_dir()).unwrap_or(false);
            let b_is_dir = b.file_type().map(|t| t.is_dir()).unwrap_or(false);
            b_is_dir
                .cmp(&a_is_dir)
                .then(a.file_name().cmp(&b.file_name()))
        });

        for entry in entries {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            if name.starts_with('.') {
                continue;
            }

            if path.is_dir() {
                let children = build_file_tree(&path);
                nodes.push(FileNode {
                    name,
                    path: path.to_string_lossy().to_string(),
                    is_dir: true,
                    children: Some(children),
                });
            } else if name.ends_with(".md") {
                nodes.push(FileNode {
                    name,
                    path: path.to_string_lossy().to_string(),
                    is_dir: false,
                    children: None,
                });
            }
        }
    }

    nodes
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' | '\0' => '_',
            _ => c,
        })
        .collect::<String>()
        .trim()
        .to_string()
}

#[tauri::command]
fn get_file_tree() -> Vec<FileNode> {
    let notes_dir = get_notes_dir();
    build_file_tree(&notes_dir)
}

#[tauri::command]
fn read_note(path: String) -> Result<String, String> {
    let notes_dir = get_notes_dir();
    let file_path = PathBuf::from(&path);
    if !file_path.starts_with(&notes_dir) {
        return Err("Access denied: path outside notes directory".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_note(path: String, content: String) -> Result<(), String> {
    let notes_dir = get_notes_dir();
    let file_path = PathBuf::from(&path);
    if !file_path.starts_with(&notes_dir) {
        return Err("Access denied: path outside notes directory".to_string());
    }
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_note(folder_path: String, name: String) -> Result<String, String> {
    let notes_dir = get_notes_dir();
    let base = if folder_path.is_empty() {
        notes_dir.clone()
    } else {
        PathBuf::from(&folder_path)
    };

    if !base.starts_with(&notes_dir) {
        return Err("Access denied: path outside notes directory".to_string());
    }

    let sanitized_name = sanitize_filename(&name);
    let file_name = if sanitized_name.ends_with(".md") {
        sanitized_name
    } else {
        format!("{}.md", sanitized_name)
    };
    let file_path = base.join(&file_name);

    if file_path.exists() {
        return Err("File already exists".to_string());
    }

    fs::write(
        &file_path,
        format!("# {}\n\n", name.trim_end_matches(".md")),
    )
    .map_err(|e| e.to_string())?;
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn create_folder(parent_path: String, name: String) -> Result<String, String> {
    let notes_dir = get_notes_dir();
    let base = if parent_path.is_empty() {
        notes_dir.clone()
    } else {
        PathBuf::from(&parent_path)
    };

    if !base.starts_with(&notes_dir) {
        return Err("Access denied: path outside notes directory".to_string());
    }

    let sanitized_name = sanitize_filename(&name);
    let folder_path = base.join(&sanitized_name);

    if folder_path.exists() {
        return Err("Folder already exists".to_string());
    }

    fs::create_dir_all(&folder_path).map_err(|e| e.to_string())?;
    Ok(folder_path.to_string_lossy().to_string())
}

#[tauri::command]
fn delete_item(path: String) -> Result<(), String> {
    let notes_dir = get_notes_dir();
    let item_path = PathBuf::from(&path);
    if !item_path.starts_with(&notes_dir) {
        return Err("Access denied: path outside notes directory".to_string());
    }

    if item_path.is_dir() {
        fs::remove_dir_all(&item_path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&item_path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn rename_item(old_path: String, new_name: String) -> Result<String, String> {
    let notes_dir = get_notes_dir();
    let old = PathBuf::from(&old_path);
    if !old.starts_with(&notes_dir) {
        return Err("Access denied: path outside notes directory".to_string());
    }

    let sanitized_name = sanitize_filename(&new_name);
    let new_path = old.parent().ok_or("Invalid path")?.join(&sanitized_name);

    if new_path.exists() {
        return Err("An item with that name already exists".to_string());
    }

    fs::rename(&old, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_notes_directory() -> String {
    get_notes_dir().to_string_lossy().to_string()
}

#[tauri::command]
fn save_image(
    folder_path: String,
    image_data: String,
    extension: String,
) -> Result<String, String> {
    use base64::Engine;

    let notes_dir = get_notes_dir();
    let assets_dir = if folder_path.is_empty() {
        notes_dir.join(".assets")
    } else {
        let base = PathBuf::from(&folder_path);
        if !base.starts_with(&notes_dir) {
            return Err("Access denied".to_string());
        }
        base.join(".assets")
    };

    fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let sanitized_ext: String = extension
        .chars()
        .filter(|c| c.is_alphanumeric())
        .collect();
    let filename = format!(
        "{}.{}",
        id,
        if sanitized_ext.is_empty() {
            "png".to_string()
        } else {
            sanitized_ext
        }
    );
    let file_path = assets_dir.join(&filename);

    let image_bytes = base64::engine::general_purpose::STANDARD
        .decode(&image_data)
        .map_err(|e| e.to_string())?;

    fs::write(&file_path, image_bytes).map_err(|e| e.to_string())?;
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn search_notes(query: String) -> Vec<(String, String, usize)> {
    let notes_dir = get_notes_dir();
    let mut results: Vec<(String, String, usize)> = Vec::new();
    let query_lower = query.to_lowercase();
    search_in_dir(&notes_dir, &query_lower, &mut results);
    results
}

fn search_in_dir(dir: &Path, query: &str, results: &mut Vec<(String, String, usize)>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir()
                && !path
                    .file_name()
                    .map(|n| n.to_string_lossy().starts_with('.'))
                    .unwrap_or(false)
            {
                search_in_dir(&path, query, results);
            } else if path.extension().map(|e| e == "md").unwrap_or(false) {
                if let Ok(content) = fs::read_to_string(&path) {
                    for (i, line) in content.lines().enumerate() {
                        if line.to_lowercase().contains(query) {
                            results.push((
                                path.to_string_lossy().to_string(),
                                line.to_string(),
                                i + 1,
                            ));
                            if results.len() >= 100 {
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Setup system tray menu
            let show = MenuItemBuilder::with_id("show", "Show NoteX").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit NoteX").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;

            if let Some(tray) = app.tray_by_id("main") {
                tray.set_menu(Some(menu))?;
                tray.set_show_menu_on_left_click(false)?;

                let app_handle = app.handle().clone();
                tray.on_menu_event(move |_app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            window.show().ok();
                            window.set_focus().ok();
                        }
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                });

                let app_handle2 = app.handle().clone();
                tray.on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::DoubleClick { .. } = event {
                        if let Some(window) = app_handle2.get_webview_window("main") {
                            window.show().ok();
                            window.set_focus().ok();
                        }
                    }
                });
            }

            // Handle window close to minimize to tray instead
            let app_handle3 = app.handle().clone();
            if let Some(window) = app_handle3.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(win) = app_handle3.get_webview_window("main") {
                            win.hide().ok();
                        }
                    }
                });
            }

            let _ = get_notes_dir();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_file_tree,
            read_note,
            save_note,
            create_note,
            create_folder,
            delete_item,
            rename_item,
            get_notes_directory,
            save_image,
            search_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
