#!/bin/bash

reset='\033[0m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'
blue='\033[34m'

OPTIONS=("mysql" "mongodb")
SELECTION=0

clear_screen() {
    clear
}

draw_options() {
    for i in "${!OPTIONS[@]}"; do
        if [ "$i" == "$SELECTION" ]; then
            echo "${blue} ❯ ${OPTIONS[$i]}${reset}"
        else
            echo "   ${OPTIONS[$i]}"
        fi
    done
}

get_input() {
    local key
    IFS= read -rsn1 key
    case "$key" in
    $'\x1b')
        read -rsn2 key
        case "$key" in
        '[A')
            [ "$SELECTION" -gt 0 ] && SELECTION=$((SELECTION-1))
            ;;
        '[B')
            [ "$SELECTION" -lt $((${#OPTIONS[@]}-1)) ] && SELECTION=$((SELECTION+1))
            ;;
        esac
        ;;
    "")
        echo "\n[INFO] Generating database..."
        pnpm prisma generate --schema=./prisma/${OPTIONS[$SELECTION]}/schema.prisma
        exit 0
    esac
}


while true; do
    clear_screen
    draw_options
    get_input
done
