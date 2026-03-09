#!/usr/bin/env bash
set -euo pipefail

# NoteX Installer/Updater Script
# Usage:
#   Install:  curl -fsSL https://raw.githubusercontent.com/uchihashahin01/NoteX/main/install.sh | bash
#   Update:   notex-update   (after install, symlink is created)

REPO="uchihashahin01/NoteX"
APP_NAME="NoteX"
INSTALL_DIR="$HOME/.local/share/NoteX"
BIN_DIR="$HOME/.local/bin"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

check_deps() {
    for cmd in curl jq; do
        if ! command -v "$cmd" &>/dev/null; then
            error "'$cmd' is required but not installed. Install it with: sudo apt install $cmd"
        fi
    done
}

get_latest_version() {
    curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | jq -r '.tag_name'
}

get_current_version() {
    if [[ -f "$INSTALL_DIR/version" ]]; then
        cat "$INSTALL_DIR/version"
    else
        echo "none"
    fi
}

get_download_url() {
    local version="$1"
    local arch
    arch=$(uname -m)

    # Get release assets and find the AppImage or .deb
    local assets
    assets=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | jq -r '.assets[].browser_download_url')

    # Prefer AppImage for easy install
    local appimage_url
    appimage_url=$(echo "$assets" | grep -i "appimage" | grep -iv "sig" | head -1)

    if [[ -n "$appimage_url" ]]; then
        echo "$appimage_url"
        return
    fi

    # Fallback to .deb
    local deb_url
    deb_url=$(echo "$assets" | grep -i "\.deb" | head -1)

    if [[ -n "$deb_url" ]]; then
        echo "$deb_url"
        return
    fi

    error "No compatible release asset found for your system."
}

install_appimage() {
    local url="$1"
    local version="$2"
    local tmp_file
    tmp_file=$(mktemp /tmp/NoteX-XXXXXX.AppImage)

    info "Downloading $APP_NAME $version..."
    curl -fSL --progress-bar "$url" -o "$tmp_file"

    mkdir -p "$INSTALL_DIR" "$BIN_DIR"

    mv "$tmp_file" "$INSTALL_DIR/NoteX.AppImage"
    chmod +x "$INSTALL_DIR/NoteX.AppImage"

    # Create symlinks
    ln -sf "$INSTALL_DIR/NoteX.AppImage" "$BIN_DIR/notex"

    # Create updater symlink
    SCRIPT_URL="https://raw.githubusercontent.com/$REPO/main/install.sh"
    cat > "$BIN_DIR/notex-update" << 'UPDATER'
#!/usr/bin/env bash
curl -fsSL "https://raw.githubusercontent.com/uchihashahin01/NoteX/main/install.sh" | bash
UPDATER
    chmod +x "$BIN_DIR/notex-update"

    echo "$version" > "$INSTALL_DIR/version"
}

install_deb() {
    local url="$1"
    local version="$2"
    local tmp_file
    tmp_file=$(mktemp /tmp/NoteX-XXXXXX.deb)

    info "Downloading $APP_NAME $version (.deb)..."
    curl -fSL --progress-bar "$url" -o "$tmp_file"

    info "Installing .deb package (requires sudo)..."
    sudo dpkg -i "$tmp_file" || sudo apt-get install -f -y
    rm -f "$tmp_file"

    mkdir -p "$INSTALL_DIR"
    echo "$version" > "$INSTALL_DIR/version"

    # Create updater command
    mkdir -p "$BIN_DIR"
    cat > "$BIN_DIR/notex-update" << 'UPDATER'
#!/usr/bin/env bash
curl -fsSL "https://raw.githubusercontent.com/uchihashahin01/NoteX/main/install.sh" | bash
UPDATER
    chmod +x "$BIN_DIR/notex-update"
}

main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║        ${GREEN}NoteX Installer/Updater${BLUE}       ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
    echo ""

    check_deps

    info "Checking latest release..."
    local latest_version
    latest_version=$(get_latest_version)

    if [[ "$latest_version" == "null" || -z "$latest_version" ]]; then
        error "Could not find any releases. Make sure there is at least one published release."
    fi

    local current_version
    current_version=$(get_current_version)

    if [[ "$current_version" == "$latest_version" ]]; then
        ok "$APP_NAME is already up to date ($latest_version)"
        exit 0
    fi

    if [[ "$current_version" == "none" ]]; then
        info "Installing $APP_NAME $latest_version..."
    else
        info "Updating $APP_NAME from $current_version to $latest_version..."
    fi

    local download_url
    download_url=$(get_download_url "$latest_version")

    if [[ "$download_url" == *".AppImage"* ]]; then
        install_appimage "$download_url" "$latest_version"
    elif [[ "$download_url" == *".deb"* ]]; then
        install_deb "$download_url" "$latest_version"
    else
        error "Unknown package format: $download_url"
    fi

    echo ""
    ok "$APP_NAME $latest_version installed successfully!"
    echo ""
    info "Run the app:     ${GREEN}notex${NC}"
    info "Update later:    ${GREEN}notex-update${NC}"
    echo ""

    # Ensure ~/.local/bin is in PATH
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        warn "$BIN_DIR is not in your PATH."
        warn "Add this to your ~/.bashrc or ~/.zshrc:"
        echo -e "  ${YELLOW}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
        echo ""
    fi
}

main "$@"
