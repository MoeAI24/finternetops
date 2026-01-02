MBCC Finternet Ops — Training Portal ADD-ON Patch (NO REPLACEMENT)
=================================================================

This patch is built to be added as a subfolder so it does NOT replace your main site.

What you get
------------
1) /training/  -> Full training portal (modules, quizzes, progress tracking, toolkit, glossary, legal, certification, exam)
2) NAV_SNIPPET.html -> Paste into your main site nav to link into the portal
3) CTA_SNIPPET.html -> Optional hero/button link

How to apply (GitHub Pages)
---------------------------
A) Upload the /training/ folder to the ROOT of your existing site repo (do NOT overwrite your root index.html).
B) Add a link in your main navigation:
   /training/index.html
   Optional: /training/certification.html

Result
------
Main site stays at:
  /
Training portal lives at:
  /training/

Quick test
----------
Open: /training/
Click around modules, take quizzes, progress is saved in your browser (localStorage).

Notes
-----
- This is static-site friendly.
- Later we can add login/SSO + team analytics without changing the URLs.
