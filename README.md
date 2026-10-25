# IEEE Beni Suef Registration System

A responsive Arabic (RTL) registration form that runs entirely in the browser. Records are stored in the browser's `localStorage`; no server, account, or installation is required.

## Run locally

1. Open `index.html` in a modern browser, or serve this folder with a simple static server.
2. Complete the required fields. Choosing **Member** or **Board** requires a committee; choosing **High Board** requires a branch.
3. Submit the form and use **تحميل CSV / Excel** to download the locally stored registrations.

For a local development server (optional, with Python installed):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- The CSV includes a UTF-8 BOM so Arabic text opens correctly in Microsoft Excel.
- Data remains in the same browser profile until its site storage is cleared.
- The provided requirements list 21 committee values (including `Other`) and 4 branch values; all explicitly listed values are implemented.
