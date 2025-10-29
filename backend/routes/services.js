const express = require('express');
const { body } = require('express-validator');
const { 
  createService, 
  getAllServices, 
  getServicesByCategory, 
  searchServices,
  getMyServices,
  deleteService 
} = require('../controllers/servicesController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

const serviceValidation = [
  body('nome_servico').notEmpty().withMessage('Nome do serviço é obrigatório'),
  body('categoria').notEmpty().withMessage('Categoria é obrigatória'),
  body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
  body('contato').notEmpty().withMessage('Contato é obrigatório')
];

router.post('/', auth, serviceValidation, createService);
router.get('/', getAllServices);
router.get('/search', searchServices);
router.get('/category/:categoria', getServicesByCategory);
router.get('/my-services', auth, getMyServices);
router.delete('/:id', auth, deleteService);

module.exports = router;