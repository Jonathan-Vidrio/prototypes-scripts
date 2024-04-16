#!/bin/bash

# Define base API endpoint
BASE_URL="http://localhost:3000"

# Output file
OUTPUT_FILE="sqlmap_summary.typeorm.txt"

# Function to run sqlmap and filter results
run_sqlmap() {
    echo "Testing $1" | tee -a $OUTPUT_FILE
    sqlmap_output=$(sqlmap -u "$2" --data "$3" --method $4 --risk 3 --level 5 --batch)
    echo "$sqlmap_output" | grep -E "sqlmap identified|CRITICAL|WARNING" >> $OUTPUT_FILE
    echo "==========================================================" >> $OUTPUT_FILE
}

# Test endpoints
run_sqlmap "POST for Status" "$BASE_URL/status/" "Name=PROCESSING&Description=The item is currently being processed." "POST"
run_sqlmap "PATCH for Status" "$BASE_URL/status/1" "Name=COMPLETED&Description=The item processing is complete." "PATCH"
run_sqlmap "POST for Language" "$BASE_URL/language/" "Name=Spanish&Description=Books written in Spanish" "POST"
run_sqlmap "PATCH for Language" "$BASE_URL/language/1" "Name=English&Description=Books written in English" "PATCH"
run_sqlmap "POST for Editorial" "$BASE_URL/editorial/" "Name=Editorial 1&Address=123 Book St&Phone=987654320&Email=contact1@publisher.com&Website=www.editorial1.com" "POST"
run_sqlmap "PATCH for Editorial" "$BASE_URL/editorial/1" "Name=Editorial 2&Address=456 Book St&Phone=987654321&Email=contact2@publisher.com&Website=www.editorial2.com" "PATCH"
run_sqlmap "PATCH for Category" "$BASE_URL/category/1" "Name=Science Fiction&Description=Books related to scientific discoveries and theories" "PATCH"
run_sqlmap "POST for Author" "$BASE_URL/author/" "FirstName=Christopher&LastName=Sawyer&Pseudonym=IPSUV4&BirthDate=1985-12-17&Nationality=Russian" "POST"
run_sqlmap "PATCH for Author" "$BASE_URL/author/1" "FirstName=Christopher&LastName=Sawyer&Pseudonym=IPSUV4&BirthDate=1985-12-17&Nationality=Canadian" "PATCH"
run_sqlmap "POST for Book" "$BASE_URL/book/" "ISBN=997-8570-12601-8843-8&Title=Generated Book Title 9999&Subtitle=Generated Book Subtitle 9999&PublishDate=2024-01-01&Pages=252&Description=Generated Description&AuthorId=3&EditorialId=8&CategoryId=8&LanguageId=10" "POST"
run_sqlmap "PATCH for Book" "$BASE_URL/book/1" "ISBN=997-8570-12601-8843-8&Title=Generated Book Title 9999&Subtitle=Generated Book Subtitle 9999&PublishDate=2024-01-01&Pages=252&Description=Generated Description&AuthorId=3&EditorialId=8&CategoryId=8&LanguageId=10" "PATCH"
