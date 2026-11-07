# Como inserir ou trocar o vídeo de abertura

1. Abra o arquivo video-config.js no GitHub.
2. Clique no lápis para editar.
3. No campo url, cole o link do YouTube entre as aspas. Também é aceita uma URL de arquivo MP4.
4. Atualize title com o título do vídeo.
5. Salve com Commit changes na branch main e aguarde o GitHub Pages publicar.

Exemplo de estrutura (substitua pelo seu link real):

window.OPENING_VIDEO = {
  url: 'COLE_AQUI_O_LINK_DO_VIDEO',
  title: 'Título do novo vídeo'
};

Para retirar o vídeo, deixe url: ''. O bloco desaparece, sem espaço vazio. O player é responsivo, não tem reprodução automática e fica no mesmo ponto da abertura. A configuração é feita no repositório; não existe campo de edição exposto aos visitantes.
