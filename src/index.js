const http = require('http')
const fs = require('fs')
const path = require('path')
const { resetWatchers } = require('nodemon/lib/monitor/watch')

const PORT = process.env.PORT || 8080
const host = '127.0.0.1'

const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        let text = await fs.promises.readFile('src/index.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(text);
        res.end()
    }
    if (req.url.search(/(\/js\/|\/css\/)/i) !== -1) {
        let mimes = {
            js: 'application/javascript',
            css: 'text/css',
        };
        const extensionTypes = Object.keys(mimes)
        const extensions = new RegExp('\.(' + extensionTypes.join('|') + ')$')
        const mimeType = req.url.match(extensions)
        const filePath = path.join(__dirname, req.url)

        try {
            const file = await fs.promises.readFile(filePath, 'utf-8')
            res.writeHead(200, { 'Content-Type': mimes[mimeType[1]] })
            res.write(file)
            res.end()
        } catch (e) {
            res.writeHead(404, { 'Content-Type': 'text/html' })
            res.write('Страница не найдена')
            res.end()
        }
    }

    if (req.method == 'POST' && req.url === '/upload') {
        let chunks = []
        console.log(req.headers)
        const fileName = '_' + req.headers['x-file-name']
        const filePath = path.join(__dirname + '/upload/' + Date.now() + fileName + '.jpg')
        const fileStream = fs.createWriteStream(filePath, {
            flags: 'a'
        });
        req.on('data', function (chunk) {
            chunks.push(chunk)
            res.write(chunk)
        })
        fileStream.on('data', function (chunk) {
            res.write(chunk.length.toString());
        })
        fileStream.on('close', function () {
            res.write(chunks.concat().length.toString());
            res.end();
        })
        req.pipe(fileStream)
        /*req.on('end', function () {
            let buffer = Buffer.concat(chunks).toString();
            const newStr = buffer.replace(/(.+Boundary.+)/g, "")
            const arr = newStr.trim().split('\r\n\r\n')
            const one = arr[0].match(/filename=".+"/g)[0].replace(/"+/g, '').split('=')[1]
            const stream = fs.createWriteStream(path.join(__dirname + '/upload/' + one), {
                encoding: 'ascii'
            })
            stream.write(arr[1])
            res.writeHead(200);
            res.end();
        });*/
    }

})

server.listen(PORT, host, () => {
    console.log(`Server listens http://${host}:${PORT}`)
})



