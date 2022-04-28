const form = document.querySelector('form')
const fileInput = document.querySelector("#filename")
const imgBox = document.querySelector('.preload-images')
const uploadButton = document.querySelector('.upload')
const reset = document.querySelector('.reset')
let images = []

function getSize(size) {
    return Math.floor(size / 1024)
}

function removeImg(event, name, index) {
    const elemAttr = `[data-index="${index}"]`
    const elem = imgBox.querySelector(elemAttr)
    if (elem) {
        const result = confirm('Вы точно хотите удалить это изображение?')
        if (result) {
            elem.classList.add('remove')
            setTimeout(() => {
                elem.remove()
            }, 1000)
            for (let i = 0; i < images.length; i++) {
                if (images[i].name === name) {
                    images.splice(i, 1)
                }
            }
            if (!images.length) {
                fileInput.value = ''
                form.reset()
                images = []
                imgBox.innerHTML = ''
                uploadButton.removeAttribute('disabled')
            }
        }
    }
}

function render({ src, size, name, index }) {
    const container = document.createElement('div')
    const remove = document.createElement('span')
    const footer = document.createElement('span')
    const img = document.createElement('img')
    const loader = document.createElement('span')
    const fileName = document.createElement('span')
    const fileSize = document.createElement('span')

    container.classList.add('image')
    remove.classList.add('image-delete')
    footer.classList.add('image-footer')
    loader.classList.add('image-loader')

    container.dataset.index = index
    container.draggable = 'true'
    remove.addEventListener('click', (event) => removeImg(event, name, index))

    img.src = src
    fileName.append(name)
    fileSize.append(size, ' kb')
    remove.append('X')
    footer.append(fileName, fileSize)
    container.append(remove, footer, img, loader)
    imgBox.append(container)
}


function createPreImg(file) {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        const dataSrc = {
            src: reader.result,
            size: getSize(file.size),
            name: file.name,
            index: file.lastModified + file.size + file.name
        }
        images.push(file)
        render(dataSrc)
    })
    reader.readAsDataURL(file)

}

fileInput.addEventListener('change', (event) => {
    console.log(event.target.files)
    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
        createPreImg(files[i])
    }
})

reset.addEventListener('click', (event) => {
    event.preventDefault()
    form.reset()
    images = []
    imgBox.innerHTML = ''
    uploadButton.removeAttribute('disabled')
})


function toPercent(loadByte, totalByte) {
    return Math.floor((loadByte / totalByte) * 100)
}

uploadButton.addEventListener('click', async (event) => {
    console.log('click')
    event.preventDefault()
    if (images.length) {
        for (let i = 0; i < images.length; i++) {
            const imgDiv = `[data-index="${images[i].lastModified + images[i].size + images[i].name}"]`
            console.log(imgDiv)
            const div = document.querySelector(imgDiv)
            const loader = div.querySelector('.image-loader')
            const contentLength = images[i].size
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload')
            xhr.setRequestHeader('Content-Type', 'multipart/form-data')
            xhr.setRequestHeader('x-file-name', images[i].name)
            xhr.send(images[i])
            xhr.onload = function () {
                console.log(`Изображение ${images[i]} загружено`)
                uploadButton.setAttribute('disabled', true)
            };

            xhr.onerror = function () {
                alert('Ошибка загрузки данных')
            };

            xhr.onprogress = function (event) {
                let progress = toPercent(event.loaded, contentLength)
                loader.style.width = progress + '%'
                loader.textContent = progress + '%'
            };
        }
    } else {
        alert('Нет изображений для отправки на сервер!')
    }
})




/*Drag and drop*/
imgBox.addEventListener('dragstart', (e) => {
    e.target.closest('.image').classList.add('selected')
})

imgBox.addEventListener('dragend', (e) => {
    e.target.closest('.image').classList.remove('selected')
})

const getNextElement = (cursorPosition, currentElement) => {
    let nextElement = null
    const currentElemCoords = currentElement.getBoundingClientRect()
    const сenterCurrentElem = currentElemCoords.x + currentElemCoords.width / 2

    if (cursorPosition < сenterCurrentElem) {
        nextElement = currentElement
    } else {
        nextElement = currentElement.nextElementSibling
    }
    return nextElement;
};

imgBox.addEventListener('dragover', (e) => {
    e.preventDefault()

    const activeElem = document.querySelector('.selected')
    const currentElem = e.target.closest('.image')

    const isDifferent = activeElem !== currentElem && currentElem?.classList.contains('image')

    if (!isDifferent) {
        return
    }
    const nextElem = getNextElement(e.clientX, currentElem)

    if (nextElem && activeElem === nextElem.previousElementSibling ||
        activeElem === nextElem) {
        return
    }

    imgBox.insertBefore(activeElem, nextElem)
})