Musica de fondo (chiptune / vocaloid style)
=============================================

Para usar tu propia pista con licencia:

1. Consigue un archivo de audio (mp3 recomendado) con licencia propia o libre de derechos.
2. Nombralo exactamente: bgm.mp3
3. Colocalo en esta carpeta (public/), junto a este archivo.
4. Listo - la app lo detecta y lo reproduce automaticamente en loop cuando el
   usuario elige "con sonido" en la pantalla de bienvenida. No hay que tocar codigo.

Si no agregas el archivo, la app usa un loop corto sintetizado (arpegio simple)
como relleno - ver src/lib/bgm.ts.
