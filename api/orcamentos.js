const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Método não permitido' });
    return;
  }

  const { nomeCliente, endereco, telefone, itens } = req.body;

  if (!nomeCliente || !endereco || !telefone || !itens || !itens.length) {
    res.status(400).json({ success: false, message: 'Dados incompletos' });
    return;
  }

  try {
    const db = await open({
      filename: './orcamentos.db',
      driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS orcamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeCliente TEXT,
      endereco TEXT,
      telefone TEXT,
      itens TEXT,
      dataCriacao TEXT
    )`);

    const result = await db.run(
      `INSERT INTO orcamentos (nomeCliente, endereco, telefone, itens, dataCriacao)
       VALUES (?, ?, ?, ?, ?)`,
      nomeCliente,
      endereco,
      telefone,
      JSON.stringify(itens),
      new Date().toISOString()
    );

    await db.close();

    res.status(200).json({ success: true, orcamentoId: result.lastID });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
