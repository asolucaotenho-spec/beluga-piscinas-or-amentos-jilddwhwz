# Perfis de cliente — Pro Master

Um arquivo `<slug>.json` por cliente, copiado de `_template.json`.

- Só **paleta**, **família/intensidade/look**, **fontes de apoio**, **trilha/SFX** e
  **elementos temáticos** mudam por cliente. O resto do sistema é fixo (ver `../SKILL.md`).
- Cores sempre das fontes oficiais do cliente (manual de marca, logo, site). Se não houver,
  pergunte antes de editar.
- `pm_titles.py --client <arquivo>` lê `palette`; `pm_grade.sh --accent/--shadow` usa as
  mesmas cores para puxar o grade para a marca.
