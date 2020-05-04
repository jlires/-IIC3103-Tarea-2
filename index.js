"use strict";

const express = require("express");
const models = require('./models/models.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://hamburguesero:hamburguesero@cluster0-vgj33.mongodb.net/hamburgueseria?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('You are now connected to Mongo!'))
    .catch(err => console.error('Something went wrong', err));

let IngredienteEnHamburguesa = mongoose.model('IngredienteEnHamburguesa', models.ingredienteEnHamburguesaSchema);
let Hamburguesa = mongoose.model('Hamburguesa', models.hamburguesaSchema);
let Ingrediente = mongoose.model('Ingrediente', models.ingredienteSchema);
let Counter = mongoose.model('counter', models.counterSchema);

var PORT = process.env.PORT || 3000;
var ROOT = "localhost:3000";

const app = express();
app.use(express.json());

// GET /hamburguesa [Todos los hamburguesas]
app.get("/hamburguesa", (req, res) => {
  console.log('GET /hamburguesa');
  Hamburguesa.find((err, hamburguesas) => {
    if(err) res.status(500).send(err.message);
    else res.status(200).jsonp(hamburguesas);
  });
});

// POST /hamburguesa [Crea una hamburguesa]
app.post("/hamburguesa", (req, res) => {
  console.log('POST /hamburguesa');
  var hamburguesa = new Hamburguesa(req.body);
  console.log(hamburguesa);
  hamburguesa.save((err, h) => {
    if(err) res.status(400).send("Input invalido");
    else res.status(201).jsonp(h);
  });
});

// GET /hamburguesa/{id} [Hamburguesa según id]
app.get("/hamburguesa/:id", (req, res) => {
  console.log(`GET /hamburguesa/${req.params.id}`);
  Hamburguesa.findOne({_id: req.params.id }, (err, hamburguesa) => {
    if(err) res.status(500).send(err.message);
    else if(hamburguesa === null) res.status(404).send("Hamburguesa inexistente.")
    else res.status(200).jsonp(hamburguesa);
  });
});

// DELETE /hamburguesa/{id} [Remover hamburguesa según id]
app.delete("/hamburguesa/:id", (req, res) => {
  console.log(`DELETE /hamburguesa/${req.params.id}`);
  Hamburguesa.findByIdAndDelete({_id: req.params.id }, (err, hamburguesa) => {
    if(err) res.status(500).send(err.message);
    else if(hamburguesa === null) res.status(404).send("Hamburguesa inexistente.");
    else res.status(200).jsonp(hamburguesa);
  });
});

// PATCH /hamburguesa/{ham_id}/ingrediente/{ing_id} [Agregar ingrediente a hamburguesa según ids]
app.patch("/hamburguesa/:id", (req, res) => {
  console.log(`PATCH /hamburguesa/${req.params.id}`);
  if (!Object.keys(req.body).every((x) => {return ["nombre", "precio", "descripcion", "imagen"].includes(x);})) {
    res.status(400).send("Parametros invalidos.");
  } else {
    Hamburguesa.findOneAndUpdate({_id: req.params.id }, req.body, {new: true}, (err, hamburguesa) => {
      if(err) res.status(400).send("Parametros invalidos.");
      else if(hamburguesa === null) res.status(404).send("Hamburguesa inexistente.");
      else {
        res.status(200).jsonp(hamburguesa);
      }
    });
  }
});

// PUT /hamburguesa/{ham_id}/ingrediente/{ing_id} [Agregar ingrediente a hamburguesa según ids]
app.put("/hamburguesa/:hid/ingrediente/:iid", (req, res) => {
  console.log(`PUT /hamburguesa/${req.params.hid}/ingrediente/${req.params.iid}`);
  Ingrediente.findById({_id: req.params.iid }, (err, ingrediente) => {
    if(err) res.status(500).send(err.message);
    else if(ingrediente === null) res.status(404).send("Ingrediente inexistente.");
    else {
      const path = `${ROOT}/ingrediente/${req.params.iid}`;
      let ing = new IngredienteEnHamburguesa({
        path: path
      });
      Hamburguesa.findOneAndUpdate({_id: req.params.hid, 'ingredientes.path': {$ne: path}}, {$push: { ingredientes: ing }}, {new: true}, (err, hamburguesa) => {
        if(err) res.status(500).send(err.message);
        else if(hamburguesa === null) {
          res.status(400).send("Hamburguesa inexistente.");
        }
        else {
          res.status(200).jsonp(hamburguesa);
        }
      });
    }
  });
});

// DELETE /hamburguesa/{ham_id}/ingrediente/{ing_id} [Agregar ingrediente a hamburguesa según ids]
app.delete("/hamburguesa/:hid/ingrediente/:iid", (req, res) => {
  console.log(`DELETE /hamburguesa/${req.params.hid}/ingrediente/${req.params.iid}`);
  Ingrediente.findById({_id: req.params.iid }, (err, ingrediente) => {
    if(err) res.status(500).send(err.message);
    else if(ingrediente === null) res.status(404).send("Ingrediente inexistente.");
    else {
      const path = `${ROOT}/ingrediente/${req.params.iid}`;
      Hamburguesa.findOneAndUpdate({_id: req.params.hid}, {$pull: { ingredientes: {path: path} }}, {multi: true, new: true}, (err, hamburguesa) => {
        if(err) res.status(500).send(err.message);
        else if(hamburguesa === null) {
          res.status(400).send("Hamburguesa inexistente.");
        }
        else {
          res.status(200).jsonp(hamburguesa);
        }
      });
    }
  });
});

// GET /ingrediente [Todos los ingredientes]
app.get("/ingrediente", (req, res) => {
  console.log('GET /ingrediente');
  Ingrediente.find((err, ingredientes) => {
    if(err) res.status(500).send(err.message);
    else res.status(200).jsonp(ingredientes);
  });
});

// POST /ingrediente [Crea una ingrediente]
app.post("/ingrediente", (req, res) => {
  console.log('POST /ingrediente');
  var ingrediente = new Ingrediente(req.body);
  ingrediente.save(function (err, i) {
    if(err) res.status(400).send("Input invalido");
    else res.status(201).jsonp(i);
  });
});

// PATCH /ingrediente/{ing_id} [Cambiar ingrediente]
app.patch("/ingrediente/:id", (req, res) => {
  console.log(`PATCH /ingrediente/${req.params.id}`);
  if (!Object.keys(req.body).every((x) => {return ["nombre", "descripcion"].includes(x);})) {
    res.status(400).send("Parametros invalidos.");
  } else {
    Ingrediente.findOneAndUpdate({_id: req.params.id }, req.body, {new: true}, (err, ingrediente) => {
      if(err) res.status(400).send("Parametros invalidos.");
      else if(ingrediente === null) res.status(404).send("Ingrediente inexistente.");
      else {
        res.status(200).jsonp(ingrediente);
      }
    });
  }
});

// GET /ingrediente/{id} [Ingrediente según id]
app.get("/ingrediente/:id", (req, res) => {
  console.log(`GET /ingrediente/${req.params.id}`);
  Ingrediente.findOne({_id: req.params.id }, (err, ingrediente) => {
    if(err) res.status(500).send(err);
    else if(ingrediente === null) res.status(404).send("Ingrediente inexistente.");
    else res.status(200).jsonp(ingrediente);
  });
});

// DELETE /ingrediente/{id} [Remover ingrediente según id]
app.delete("/ingrediente/:id", (req, res) => {
  console.log(`DELETE /ingrediente/${req.params.id}`);
  const path = `${ROOT}/ingrediente/${req.params.id}`;
  Ingrediente.findOne({_id: req.params.id }, (err, ingrediente) => {
    if(err) res.status(500).send(err.message);
    else if(ingrediente === null) res.status(404).send("Ingrediente inexistente.");
    else {
      Hamburguesa.findOne({ingredientes: {$elemMatch:{path:path}}}, (err, hamburguesa) => {
        if(err) res.status(500).send(err.message);
        if(hamburguesa === null) {
          ingrediente.remove(() => {
            res.status(200).jsonp(ingrediente);
          });
        } else {
          res.status(409).send("Ingrediente no se puede borrar, se encuentra presente en una hamburguesa.");
        }
      });
    }
  });
});


app.listen(PORT, () => {
 console.log("El servidor está inicializado en el puerto", PORT);
});
