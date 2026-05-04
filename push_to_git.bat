@echo off
cd /d "c:\Users\huzai\OneDrive\Desktop\AI\frontend"
git init
git config user.email "huzaifa@example.com"
git config user.name "huzaifa-2006-mh"
git add .
git commit -m "Initial commit: MHS AI Frontend"
git branch -M main
git remote add origin https://github.com/huzaifa-2006-mh/Ai-frontend.git
git push -u origin main
