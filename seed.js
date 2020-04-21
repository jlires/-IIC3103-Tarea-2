const models = require('./models/models.mjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://hamburguesero:hamburguesero@cluster0-vgj33.mongodb.net/hamburgueseria?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('You are now connected to Mongo!'))
    .catch(err => console.error('Something went wrong', err));

let IngredienteEnHamburguesa = mongoose.model('IngredienteEnHamburguesa', models.ingredienteEnHamburguesaSchema);
let Hamburguesa = mongoose.model('Hamburguesa', models.hamburguesaSchema);
let Ingrediente = mongoose.model('Ingrediente', models.ingredienteSchema);
let Counter = mongoose.model('counter', models.counterSchema);

var ingrediente1 = new Ingrediente({ nombre: 'queso', descripcion: "Delicioso producto en base a leche." });

// save model to database
ingrediente1.save(function (err, ingrediente) {
  if (err) return console.error(err);
  console.log(ingrediente);
});
