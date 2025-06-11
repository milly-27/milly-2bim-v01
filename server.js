const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

const PRODUCTS_FILE = 'products.csv';
const CUPONS_FILE = 'cupons.csv';
const USERS_FILE = 'users.csv';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

let products = [];
let cupons = [];
let users = [];

function loadDataFromCSV() {
    // Produtos
    if (fs.existsSync(PRODUCTS_FILE)) {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const lines = data.split('\n').filter(l => l.trim() !== '');
        if (lines.length > 1) {
            products = lines.slice(1).map(line => {
                const [name, price, image, category] = line.split(',').map(x => x?.trim());
                return { 
                    name, 
                    price: parseFloat(price) || 0, 
                    image: image || '', 
                    category: category || '' 
                };
            });
        }
    } else {
        fs.writeFileSync(PRODUCTS_FILE, 'name,price,image,category\n');
    }

    // Cupons
    if (fs.existsSync(CUPONS_FILE)) {
        const data = fs.readFileSync(CUPONS_FILE, 'utf8');
        const lines = data.split('\n').filter(l => l.trim() !== '');
        if (lines.length > 1) {
            cupons = lines.slice(1).map(line => {
                const [code, discount] = line.split(',').map(x => x?.trim());
                return { 
                    code, 
                    discount: parseFloat(discount) || 0 
                };
            });
        }
    } else {
        fs.writeFileSync(CUPONS_FILE, 'code,discount\n');
    }

    // Usuários
    if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const lines = data.split('\n').filter(l => l.trim() !== '');
        if (lines.length > 1) {
            users = lines.slice(1).map(line => {
                const [username, email, password, tipo] = line.split(',').map(x => x?.trim());
                return { 
                    username, 
                    email, 
                    password, 
                    tipo: tipo || 'cliente' 
                };
            });
        }
    } else {
        fs.writeFileSync(USERS_FILE, 'username,email,password,tipo\n');
    }
}

function saveDataToCSV() {
    try {
        // Produtos
        let productsCSV = 'name,price,image,category\n';
        products.forEach(p => {
            productsCSV += `${p.name},${p.price},${p.image || ''},${p.category || ''}\n`;
        });
        fs.writeFileSync(PRODUCTS_FILE, productsCSV);

        // Cupons
        let cuponsCSV = 'code,discount\n';
        cupons.forEach(c => {
            cuponsCSV += `${c.code},${c.discount}\n`;
        });
        fs.writeFileSync(CUPONS_FILE, cuponsCSV);

        // Usuários
        let usersCSV = 'username,email,password,tipo\n';
        users.forEach(u => {
            usersCSV += `${u.username},${u.email},${u.password},${u.tipo || 'cliente'}\n`;
        });
        fs.writeFileSync(USERS_FILE, usersCSV);

    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

loadDataFromCSV();

// --- Produtos ---
app.get('/produtos', (req, res) => {
    res.json(products);
});

app.post('/produtos', (req, res) => {
    const { name, price, image, category } = req.body;
    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }

    if (products.find(p => p.name === name)) {
        return res.status(400).json({ message: 'Produto já existe' });
    }

    const newProduct = { 
        name, 
        price: parseFloat(price), 
        image: image || '', 
        category: category || '' 
    };
    products.push(newProduct);
    saveDataToCSV();
    res.status(201).json(newProduct);
});

app.put('/produtos/:name', (req, res) => {
    const nameParam = req.params.name;
    const { name, price, image, category } = req.body;
    const index = products.findIndex(p => p.name === nameParam);
    
    if (index === -1) return res.status(404).json({ message: 'Produto não encontrado' });

    products[index] = {
        name: name || products[index].name,
        price: price !== undefined ? parseFloat(price) : products[index].price,
        image: image !== undefined ? image : products[index].image,
        category: category !== undefined ? category : products[index].category
    };

    saveDataToCSV();
    res.json(products[index]);
});

app.delete('/produtos/:name', (req, res) => {
    const nameParam = req.params.name;
    const index = products.findIndex(p => p.name === nameParam);
    
    if (index === -1) return res.status(404).json({ message: 'Produto não encontrado' });

    const removed = products.splice(index, 1)[0];
    saveDataToCSV();
    res.json(removed);
});

// --- Cupons ---
app.get('/cupons', (req, res) => {
    res.json(cupons);
});

app.post('/cupons', (req, res) => {
    const { code, discount } = req.body;
    if (!code || discount === undefined) {
        return res.status(400).json({ message: 'Código e desconto são obrigatórios' });
    }

    if (cupons.find(c => c.code === code)) {
        return res.status(400).json({ message: 'Cupom já existe' });
    }

    const newCupom = { code, discount: parseFloat(discount) };
    cupons.push(newCupom);
    saveDataToCSV();
    res.status(201).json(newCupom);
});

app.put('/cupons/:code', (req, res) => {
    const codeParam = req.params.code;
    const { code, discount } = req.body;
    const index = cupons.findIndex(c => c.code === codeParam);
    
    if (index === -1) return res.status(404).json({ message: 'Cupom não encontrado' });

    cupons[index] = {
        code: code || cupons[index].code,
        discount: discount !== undefined ? parseFloat(discount) : cupons[index].discount
    };

    saveDataToCSV();
    res.json(cupons[index]);
});

app.delete('/cupons/:code', (req, res) => {
    const codeParam = req.params.code;
    const index = cupons.findIndex(c => c.code === codeParam);
    
    if (index === -1) return res.status(404).json({ message: 'Cupom não encontrado' });

    const removed = cupons.splice(index, 1)[0];
    saveDataToCSV();
    res.json(removed);
});

// Rota para validar cupom
app.post('/cupons/validar', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: 'Código do cupom é obrigatório' });
    }

    const cupom = cupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!cupom) {
        return res.status(404).json({ message: 'Cupom não encontrado' });
    }

    res.json({ 
        valid: true, 
        discount: cupom.discount,
        message: `Cupom válido! Desconto de ${(cupom.discount * 100).toFixed(0)}%`
    });
});

// --- Usuários ---
app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    const { username, email, password, tipo } = req.body;
    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, usuário e senha são obrigatórios' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    const newUser = { 
        username, 
        email, 
        password, 
        tipo: tipo || 'cliente' 
    };
    users.push(newUser);
    saveDataToCSV();
    res.status(201).json(newUser);
});

app.put('/users/:email', (req, res) => {
    const emailParam = req.params.email;
    const { username, email, password, tipo } = req.body;
    const index = users.findIndex(u => u.email === emailParam);
    
    if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado' });

    users[index] = {
        username: username || users[index].username,
        email: email || users[index].email,
        password: password || users[index].password,
        tipo: tipo || users[index].tipo || 'cliente'
    };

    saveDataToCSV();
    res.json(users[index]);
});

app.delete('/users/:email', (req, res) => {
    const emailParam = req.params.email;
    const index = users.findIndex(u => u.email === emailParam);
    
    if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado' });

    const removed = users.splice(index, 1)[0];
    saveDataToCSV();
    res.json(removed);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});