# FinanceFlow

Um sistema web completo de controle financeiro pessoal inteligente, focado em organização, simulação e alertas visuais. Desenvolvido com padrão visual premium.

## Tecnologias

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Shadcn UI (Componentes Premium)
- Recharts (Gráficos)
- Prisma (ORM) + PostgreSQL
- Lucide Icons

## Como rodar o projeto

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o banco de dados local (Opcional):**
   Criamos um `docker-compose.yml` para facilitar o uso do Postgres local.
   ```bash
   docker-compose up -d
   ```
   
   Após o banco estar rodando, sincronize o Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

*Nota:* O projeto conta com **mock data** diretamente aplicado na UI (Dashboard, Tabelas, Gráficos), garantindo que você tenha a melhor experiência visual imediatamente no primeiro "npm run dev", sem se preocupar em preencher formulários inicialmente.
