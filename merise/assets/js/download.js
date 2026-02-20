/* ============================================================
   MERISE — download.js
   Modal de téléchargement : PDF (print), Markdown, TXT
   ============================================================ */
class CourseDownloader {
    constructor() {
        this.injectButton();
        this.createModal();
    }

    injectButton() {
        const nav = document.querySelector('.nav-actions');
        if (!nav) return;
        const btn = document.createElement('button');
        btn.className = 'download-btn';
        btn.innerHTML = '<i class="fas fa-download"></i>';
        btn.setAttribute('aria-label', 'Télécharger le cours');
        btn.title = 'Télécharger';
        btn.addEventListener('click', () => this.open());
        nav.insertBefore(btn, nav.firstChild);
    }

    createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'download-overlay';
        overlay.id = 'download-overlay';
        overlay.innerHTML = `
            <div class="download-modal">
                <button class="download-close" aria-label="Fermer">&times;</button>
                <h3 style="font-weight:700;margin-bottom:0.25rem;">Télécharger</h3>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem;">Choisissez le format d'export</p>
                <div class="download-option" data-format="pdf">
                    <i class="fas fa-file-pdf"></i>
                    <div><strong>PDF</strong><br><small style="color:var(--text-muted)">Via l'impression du navigateur</small></div>
                </div>
                <div class="download-option" data-format="md">
                    <i class="fas fa-file-code"></i>
                    <div><strong>Markdown</strong><br><small style="color:var(--text-muted)">Format Markdown (.md)</small></div>
                </div>
                <div class="download-option" data-format="txt">
                    <i class="fas fa-file-alt"></i>
                    <div><strong>TXT</strong><br><small style="color:var(--text-muted)">Texte brut</small></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.download-close').addEventListener('click', () => this.close());
        overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });

        overlay.querySelectorAll('.download-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const format = opt.dataset.format;
                if (format === 'pdf') this.exportPDF();
                else if (format === 'md') this.exportMD();
                else if (format === 'txt') this.exportTXT();
                this.close();
            });
        });
    }

    open() { document.getElementById('download-overlay')?.classList.add('active'); }
    close() { document.getElementById('download-overlay')?.classList.remove('active'); }

    exportPDF() { window.print(); }

    exportMD() {
        const main = document.querySelector('main') || document.body;
        const title = document.title || 'Cours MERISE';
        const elements = main.querySelectorAll('h1,h2,h3,h4,p,pre,li,code,td,th');
        let md = `# ${title}\n\n`;
        elements.forEach(el => {
            const text = el.textContent.trim();
            if (!text) return;
            switch (el.tagName) {
                case 'H1': md += `# ${text}\n\n`; break;
                case 'H2': md += `## ${text}\n\n`; break;
                case 'H3': md += `### ${text}\n\n`; break;
                case 'H4': md += `#### ${text}\n\n`; break;
                case 'PRE': md += `\`\`\`\n${text}\n\`\`\`\n\n`; break;
                case 'LI': md += `- ${text}\n`; break;
                case 'P': md += `${text}\n\n`; break;
                default: break;
            }
        });
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        this.download(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`);
    }

    exportTXT() {
        const main = document.querySelector('main') || document.body;
        const text = main.innerText;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        this.download(blob, `${document.title || 'cours_merise'}.txt`);
    }

    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => new CourseDownloader());
