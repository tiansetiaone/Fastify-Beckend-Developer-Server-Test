# Gunakan Node.js sebagai image dasar
FROM node:18

# Setel direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin kode aplikasi
COPY . .

# Expose port
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "src/index.js"]
