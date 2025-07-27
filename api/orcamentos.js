import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Método não permitido' });
    return;
  }

  try {
    const db = await open({
      filename: './orcamentos.db',
      driver: sqlite3.Database
    });

    const { nomeCliente, endereco, telefone, itens } = req.body;

    if (!nomeCliente || !endereco || !telefone || !Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({ message: 'Dados inválidos' });
      return;
    }

    await db.run(
      `CREATE TABLE IF NOT EXISTS orcamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        endereco TEXT,
        telefone TEXT
      )`
    );

    const result = await db.run(
      'INSERT INTO orcamentos (nome, endereco, telefone) VALUES (?, ?, ?)',
      [nomeCliente, endereco, telefone]
    );

    const orcamentoId = result.lastID;

    await db.run(
      `CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orcamento_id INTEGER,
        descricao TEXT,
        quantidade INTEGER,
        largura REAL,
        tamanho REAL,
        m2 REAL,
        precoM2 REAL,
        total REAL
      )`
    );

    for (const item of itens) {
      await db.run(
        'INSERT INTO itens (orcamento_id, descricao, quantidade, largura, tamanho, m2, precoM2, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          orcamentoId,
          item.descricao,
          item.quantidade,
          item.largura,
          item.tamanho,
          item.m2,
          item.precoM2,
          item.total
        ]
      );
    }

    res.status(200).json({ success: true, orcamentoId });
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
}
