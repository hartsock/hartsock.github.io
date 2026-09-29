---
title: "The Compiler That Overwrote the Bills"
series: age-of-the-confused-deputy
part: 1
dek: "Why a coding agent can be a confused deputy"
read_time: "~2 min"
permalink: /age-of-the-confused-deputy/the-compiler-that-overwrote-the-bills/
published: false
---
In the late 1970s, Tymshare ran a commercial timesharing service. Its compiler lived in a directory called SYSX, beside the file that held customer billing, (SYSX)BILL. The compiler needed to write billing records, so the system let it write there.

The compiler also accepted a filename for optional debugging output. One user supplied the name of the billing file, and the compiler overwrote the billing records with debugging output. The billing information was lost.

The compiler wasn't malicious; it did what it was asked. Norm Hardy, who worked there, described the incident in 1988 and called the compiler a "confused deputy": a program that holds authority of its own, acts on someone else's request, and cannot tell which of its powers that request may use. The system asked "may the compiler write here?" It never asked "may this user, through the compiler, write here?"

A coding agent can be in the same position. It holds your authority: your files, your shell, your credentials, your network. It also reads text it did not write: a README, an issue, a web page, a colleague's task file. Any of that text can contain instructions, and nothing guarantees the agent can tell yours from the author's. Where the only check is "may the agent do this?", the answer is yes, as it was for the compiler. This is an argument from structure; it does not measure how often agents are misled.

A better model or a stricter prompt makes a mistake less likely without changing what that check asks. The capability answer changes it: the user hands the compiler the debug file itself, not a name the compiler resolves with its own authority, so a user with no access to the billing file cannot point the compiler at it. What plays the part of the handed-over file for an agent is the open question.

Source: N. Hardy, "The Confused Deputy (or why capabilities might have been invented)," ACM SIGOPS Operating Systems Review 22(4), 1988, pp. 36-38.
