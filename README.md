# CloudIgnite Quest Log

A Chrome extension that turns the AWS re/Start Canvas module list into a game-themed quest log with personal checkboxes, progress, filters, and arcade celebrations.

## Install

1. Open `chrome://extensions` and enable Developer mode.
2. Choose **Load unpacked** and select this repository folder.
3. Visit the AWS re/Start course Modules page and expand modules to import visible items.
4. Open **Quest Log** using the extension icon or the button on the page.

Canvas completion and personal checkboxes are distinct. Data is stored locally in Chrome. Canvas updates are captured when you visit the modules page; there is no background or two-way sync. Sound and speech can be disabled using the toggle in the quest log.

The extension currently targets course 4611 at awsrestart.instructure.com; change the matching URL in `manifest.json` for a different course. This project is not affiliated with AWS or Canvas.

## Lab celebrations

On a Vocareum lab page, after selecting End Lab and the session ends, open Grades. When the Grades panel reports 1/1, the extension displays a celebration. The Quest Log sound setting controls the fanfare and speech; if the browser blocks automatic audio, use the Play Fanfare button. The celebration observes the page only and does not submit, end, or grade a lab.
