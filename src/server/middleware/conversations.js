const fs = require('fs')
const path = require('path')
const dbPath = `${path.dirname(__filename)}/../db.json`

module.exports = (req, res, next) => {
  if (/conversations/.test(req.url) && req.method === 'GET') {
    const db = require(dbPath)
    const userId = req.query?.senderId
    const result = db?.conversations?.filter(
      conv => conv.senderId == userId || conv.recipientId == userId
    )
    res.status(200).json(result)
    return
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query?.id)

    if (!isNaN(id) && /^\/conversations\?/.test(req.url)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      db.conversations = (db.conversations || []).filter((c) => c.id !== id)
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
      res.status(200).json({})
      return
    }

    if (!isNaN(id) && /^\/messages\?/.test(req.url)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      db.messages = (db.messages || []).filter((m) => m.id !== id)
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
      res.status(200).json({})
      return
    }
  }

  next()
}
