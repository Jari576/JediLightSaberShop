const express = require("express")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const app = express()
const xmlparser = require('express-xml-bodyparser')

app.use(express.json({}))
app.use(express.urlencoded({ extended: true }))
app.use(xmlparser({ explicitArray: false, explicitRoot: false }))

app.get("/Jedisabershop/saber/:id", async (req, res) => {
    const { id } = req.params
    const lightsaber = await prisma.lightsaber.findFirst({
        where: { id: Number(id) }
    })
    res.json({ status: 200, body: lightsaber })
})

app.get("/Jedisabershop/saber", async (req, res) => {
    const lightsaber = await prisma.lightsaber.findMany()
    res.json({ status: 200, body: { sabers: lightsaber } })
})

app.post("/Jedisabershop/saber", async (req, res) => {
    const sabers = req.body.saber

    const DBsabers = sabers.map((saber) => {
        return {
            id: Number(saber.id),
            name: saber.name,
            available: Number(saber.available ?? 0),
            sold: Number(saber.sold ?? 0),
            crystal_name: saber.crystal.name,
            crystal_color: saber.crystal.color,
        }
    })

    for (const DBsaber of DBsabers) {
        await prisma.lightsaber.upsert({
            where: { id: DBsaber.id },
            update: { available: { increment: DBsaber.available } },
            create: DBsaber
        })

    }
    res.json({ status: 205 })
})

app.get("/Jedisabershop/order/saber/:id", async (req, res) => {
    const { id } = req.params
    const lightsaber = await prisma.lightsaber.findUnique({
        where: { id: Number(id) }
    })
    res.type('html')
    res.send(`<table>
    <tr>
        <th>id</th>
        <td>${lightsaber.id}</td>
    </tr>
    <tr>
        <th>name</th>
        <td>${lightsaber.name}</td>
    </tr>
    <tr>
        <th>crystal name</th>
        <td>${lightsaber.crystal_name}</td>
    </tr>
    <tr>
        <th>crystal color</th>
        <td>${lightsaber.crystal_color}</td>
    </tr>
    <tr>
        <th>price</th>
        <td>${{ red: 2020, blue: 190, green: 814 }[lightsaber.crystal_color]}</td>
    </tr>
    </table>
    <div>Buy this saber?</div>
    <form action="" method="post">
        <button 
            name="buybutton"
            value="buy"
            ${lightsaber.available == 0 ? disabled : ``}
        >confirm</button>
    </form>`)
})

app.post("/Jedisabershop/order/saber/:id", async (req, res) => {
    const { id } = req.params
    const lightsaber = await prisma.lightsaber.findUnique({
        where: { id: Number(id) }
    })
    if (lightsaber.available == 0) res.json({ error: "saber no longer available" })
    await prisma.lightsaber.update({
        where: { id: Number(id) },
        data: {
            available: { decrement: 1 },
            sold: { increment: 1 }
        }
    })
    res.format({
        json: function() {
            res.json({ 
                status: 201, body: {
                    message: "order succesfull",
                    lightsabername: lightsaber.name,
                }
            })
        },
        html: function() {
            res.send(`
                <div>succesfully ordered ${lightsaber.name}</div>
                <button
                    onclick="location.pathname='Jedisabershop'"
                    name="buybutton"
                    value="buy"
                >return home</button>
            `)
        }
    })
})

app.get("/Jedisabershop", async (req, res) => {
    const lightsabers = await prisma.lightsaber.findMany()
    res.type('html')
    res.send(`
        <style>
            table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
            }
        </style>
    <table>
        <tr>
            <th>id</th>
            <th>name</th>
            <th>available</th>
            <th>crystal name</th>
            <th>crystal color</th>
            <th>price</th>
            <th></th>
        </tr>`
        + lightsabers.map(function(saber) {
            return (`<tr>
                <td>${saber.id}</td>
                <td>${saber.name}</td>
                <td>${saber.available}</td>
                <td>${saber.crystal_name}</td>
                <td>${saber.crystal_color}</td>
                <td>${{ red: 2020, blue: 190, green: 814 }[saber.crystal_color]}</td>
                <td>
                    <button
                        onclick="location.pathname='Jedisabershop/order/saber/${saber.id}'"
                        name="buybutton"
                        value="buy"
                        ${saber.available == 0 ? disabled : ``}
                    >buy</button>
                </td>
            </tr>`)
        })
        + `</table>`
    );
})

app.get("/", (req, res) => {
    res.redirect("/Jedisabershop")
})

const server = app.listen(3000, () =>
    console.log(`Server ready at: http://localhost:3000 `),
)
