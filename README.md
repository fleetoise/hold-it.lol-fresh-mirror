# hold-it-lol
Quality of life [https://objection.lol/courtroom](objection.lol) courtroom features & tweaks, ranging from tiny UI changes to roleplay testimony UIs.

**Important:** the extension is still in beta - some assets are unfinished.

## Options

Upon installation, there is a page of options with descriptions to personalize your courtroom experience and pick only the features you like.

It can be accessed by clicking the extension icon in the top right (you may need to pin it in the extensions list). (Option preview images are currently... placeholders)

<details>
<summary><i>A full list of features provided by the extension</i></summary>
<blockquote>
<dl>
<dt><table>
<tr><td>Auto-recording</td><td>Automatically start recording joined courtrooms (saving is manual).</td></tr>
<tr><td>Remember last character</td><td>The last character you used (with the extension on) is selected by default in the next court.</td></tr>
<tr><td>Disable T key</td><td>Turn off the "T" hotkey that toggles "give testimony".</td></tr>
<tr><td>Unblur pixel characters</td><td>Makes character poses with low resolutions sharp instead of blurry.</td></tr>
<tr><td>Auto-closing menus</td><td>Automatically close formatting menus after you've used them.</td></tr>
<tr><td>Open menus by hovering</td><td>Open formatting menus by hovering over them instead of clicking.</td></tr>
<tr><td>Sounds and music: Quick inserting</td><td>Add sounds just by clicking on them in the list (without pressing "insert tag")<br>(Hold "SHIFT" to suppress)</td></tr>
<tr><td>Extra color tags</td><td>Converts [#/y], [#/w] and [#/dr] into valid color tags.</td></tr>
<tr><td>"No talking" toggle</td><td>Disables your character's talking animation, just like in Maker.</td></tr>
<tr><td>Quickly typing pauses</td><td>Type , again after a , (or other punctuation marks) to add delays.<br>(Typing more , increases the delay.)</td></tr>
<tr><td>Effect hotkeys</td><td>Quickly add the Flash and Shake tags by pressing CTRL + 1, CTRL + 2, or CTRL + 3.</td></tr>
<tr><td>Dual effect button</td><td>Insert both Flash and Shake at the same time.</td></tr>
<tr><td>Smart pre-animate</td><td>Disables your pose's pre-animation until you use a different pose.</td></tr>
<tr><td>Smart "to normal" poses</td><td>When switching to a new pose, automatically plays the previous pose's "to normal" when available.<br>(Lags less without Preload Resources.)</td></tr>
<tr><td>Classic toggles</td><td>Toggles like "Pre-animate" are accessible outside of a menu (as it was in the past).</td></tr>
<tr><td>Clickable chat links</td><td>URLs in chat messages become clickable. You can <i>also</i> right click to quickly save sounds & music.</td></tr>
<tr><td>Separate volume sliders</td><td>Adjust the volume of music and sound effects separately.</td></tr>
<tr><td>Full screen in record</td><td>Mention full-screen evidence from the court record.</td></tr>
<tr><td>"Preload Resources" while spectating</td><td>Toggle "Preload Resources" while spectating.</td></tr>
<tr><td>Reload custom characters</td><td>Reload others' custom characters from Settings to see their changes without reloading the page.</td></tr>
<tr><td>Automatic re-mute</td><td>(Discord auth required) Automatically re-mutes a muted user if they rejoin.</td></tr>
<tr><td>Moderate from chat log</td><td>Quickly mute or ban using buttons next to their messages.</td></tr>
<tr><td>Moderate from user list</td><td>Quickly mute, ban anyone or make them a moderator from the user list.</td></tr>
<tr><td>Hide character</td><td>Someone's character is laggy or unpleasant? Mute just the character, while still seeing their messages.</td></tr>
<tr><td>Roleplay testimony</td><td>A helpful witness testimony player for roleplay.</td></tr>
<tr><td>Add evidence from table</td><td>Automatically add lots of evidence via a copy-pasted table from a document.<br>(Works with tables where each evidence takes up a row)</td></tr>
<tr><td>"Now playing..." display</td><td>Shows the name given to the currently playing track.</td></tr>
<tr><td>Text-to-speech</td><td>Plays messages using wacky text-to-speech voices.</td></tr>
<tr><td>Pose icons for all characters</td><td>Add pose icons to characters that lack them using an in-courtroom editor.</td></tr>
<tr><td>Custom character archiver</td><td>Download and preserve character images. (Warning: downloads will lag and may disconnect your current courtroom page.)</td></tr>
<tr><td>Music Packs</td><td>Use Ace Attorney songs from any game in objection.lol beyond the default music.</td></tr>
</table></dt>
</dl>
</blockquote>
</details>

## Discussion

If you have any questions, problems or suggestions regarding the extension, you can join our [Discord server](https://discord.gg/KqjQUrHuXH).

## Installation instructions

1. Download the top .zip file from the [latest release on Codeberg](https://codeberg.org/adamanti/hold-it-lol/releases/tag/v0.7.2-beta).
1. Unzip the file and you should have a folder named plainly `hold-it-lol`.
1. In your Chrome-based browser go to the extensions page (for Chrome or Edge, `chrome://extensions` or `edge://extensions`).
1. Enable Developer Mode in the top right.
1. Drag the `hold-it-lol` folder onto the page to load it (do not delete the folder afterwards).

## Known Issues

Known bug warnings (as of v0.7.2 beta):

- Due to the way the extension loads, spectating breaks some UI elements; you'll be prompted to reload and join without spectating.
