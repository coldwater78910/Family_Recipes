# Recipe Website — Todo

Last updated: 11 November 2025

This file lists design tasks, feature work, infra items and the current status. I've reorganized and cleaned the list so the top sections contain active work / next steps and the bottom records completed items and notes.

## Active work (high priority)

## Recent changes

<!-- Recent changes recorded; completed markers removed for brevity. -->

## Notes

- Several legacy pages still contain inline recipe arrays; those should be consolidated to `recipes-data.js` when convenient.
- The server and ngrok setup are intentionally minimal and for local/private use only; do not expose the helper publicly without additional locking.

## Next actions

1. Fix mobile search bar (doesnt respond currently)
2. Fix footer in the Categories page, as the footer is right underneath the content instead of being fixed to the bottome of the webpage


cd ~/Desktop/"Recipes HTML"
./deploy.sh