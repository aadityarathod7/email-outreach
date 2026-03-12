#!/bin/bash

echo ""
echo "================================================================================"
echo "📊 CSV FILES INFORMATION"
echo "================================================================================"
echo ""

CSV_FILE="/Users/sjat/Desktop/email-outreach/data/File - File.csv"

if [ -f "$CSV_FILE" ]; then
    echo "✅ MAIN CSV FILE FOUND"
    echo ""
    echo "📝 FILE DETAILS:"
    echo "   Path: $CSV_FILE"
    
    # Get file size
    SIZE=$(ls -lh "$CSV_FILE" | awk '{print $5}')
    echo "   Size: $SIZE"
    
    # Get modification time
    MOD_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$CSV_FILE" 2>/dev/null || stat -c "%y" "$CSV_FILE" 2>/dev/null | cut -d' ' -f1-2)
    echo "   Last Modified: $MOD_TIME"
    
    # Count rows
    ROWS=$(wc -l < "$CSV_FILE")
    echo "   Total Lines: $ROWS"
    
    # Count users (lines - 1 for header)
    USERS=$((ROWS - 1))
    echo "   Total Users: $USERS"
    
    # Count columns
    COLS=$(head -1 "$CSV_FILE" | tr ',' '\n' | wc -l)
    echo "   Total Columns: $COLS"
    
    echo ""
    echo "📋 HEADER COLUMNS:"
    head -1 "$CSV_FILE" | tr ',' '\n' | nl
    
    echo ""
    echo "👥 FIRST 3 USERS:"
    tail -n +2 "$CSV_FILE" | head -3 | awk -F',' '{print "   • " $2 " (" $1 ")"}'
    
    echo ""
    echo "================================================================================"
else
    echo "❌ CSV FILE NOT FOUND"
fi
