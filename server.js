const fs = require('fs')
const express = require('express')

const app = express()

app.get('/', (req, res) => {
  fs.readFile('./static/index.html', (err, html) => {
    res.end(html)
  })
})

app.get('/movies/:movieName', (req,res) => {
  const { movieName } = req.params;
  const movieFile = `./static/movies/${movieName}`

  fs.stat(movieFile, (err, stats) => {
    if(err) {
      console.warn(err.message)
      return res.status(404).end('<h1>Movie not found</h1>')
    }

    //variáveis necessarias para montar o chunk header corretamente
    const { range } = req.headers
    const { size } = stats
    console.log(range)
    const start = Number((range || '').replace(/bytes=/, '').split('-')[0])
    const end = size - 1
    const chunkSize = (end - start) + 1

    //definindo headers de chunk
    res.set({
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': `bytes`,
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    })

    // status 206 - Partial Content para o streaming
    res.status(206)
    const stream = fs.createReadStream(movieFile, {start, end})
    stream.on('open', () => stream.pipe(res))
    stream.on('error', (streamErr) => res.end(streamErr))
  })
})

app.listen(3000, () => {
  console.warn('Movie flix is running in http://localhost:3000')
})