#!/bin/bash
# Run this script to seed categories after API is deployed

API="https://narzo.store/api/v1/categories"
KEY="nrz_sk_eac1cdadc9ee922f84a895c8f6c512defacf01e30379c867"

# Parent categories
curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-tech","slug":"technology","name_id":"Teknologi","name_en":"Technology","icon":"💻","sort_order":1}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-lifestyle","slug":"lifestyle","name_id":"Gaya Hidup Digital","name_en":"Digital Lifestyle","icon":"🌟","sort_order":2}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-business","slug":"business","name_id":"Bisnis","name_en":"Business","icon":"💼","sort_order":3}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-guides","slug":"guides","name_id":"Panduan","name_en":"Guides","icon":"📚","sort_order":4}'

# Technology children
curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-tutorials","slug":"tutorials","name_id":"Tutorial","name_en":"Tutorials","parent_id":"cat-tech","icon":"🎓","sort_order":1}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-reviews","slug":"reviews","name_id":"Review","name_en":"Reviews","parent_id":"cat-tech","icon":"⭐","sort_order":2}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-news","slug":"tech-news","name_id":"Berita Tech","name_en":"Tech News","parent_id":"cat-tech","icon":"📰","sort_order":3}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-tips","slug":"tips-tricks","name_id":"Tips & Trik","name_en":"Tips & Tricks","parent_id":"cat-tech","icon":"💡","sort_order":4}'

# Lifestyle children
curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-productivity","slug":"productivity","name_id":"Produktivitas","name_en":"Productivity","parent_id":"cat-lifestyle","icon":"⚡","sort_order":1}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-entertainment","slug":"entertainment","name_id":"Hiburan","name_en":"Entertainment","parent_id":"cat-lifestyle","icon":"🎬","sort_order":2}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-gaming","slug":"gaming","name_id":"Gaming","name_en":"Gaming","parent_id":"cat-lifestyle","icon":"🎮","sort_order":3}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-apps","slug":"apps","name_id":"Aplikasi","name_en":"Apps","parent_id":"cat-lifestyle","icon":"📱","sort_order":4}'

# Business children
curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-startups","slug":"startups","name_id":"Startup","name_en":"Startups","parent_id":"cat-business","icon":"🚀","sort_order":1}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-ecommerce","slug":"ecommerce","name_id":"E-commerce","name_en":"E-commerce","parent_id":"cat-business","icon":"🛒","sort_order":2}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-marketing","slug":"marketing","name_id":"Marketing","name_en":"Marketing","parent_id":"cat-business","icon":"📣","sort_order":3}'

# Guides children
curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-howto","slug":"how-to","name_id":"Cara","name_en":"How-to","parent_id":"cat-guides","icon":"🔧","sort_order":1}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-buying","slug":"buying-guide","name_id":"Panduan Beli","name_en":"Buying Guide","parent_id":"cat-guides","icon":"🛍️","sort_order":2}'

curl -X POST "$API" -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"id":"cat-comparison","slug":"comparison","name_id":"Perbandingan","name_en":"Comparison","parent_id":"cat-guides","icon":"⚖️","sort_order":3}'

echo "Done seeding categories!"
