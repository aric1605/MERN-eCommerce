import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MERN E-Commerce REST API',
      version: '1.0.0',
      description: 'Production-ready MERN E-Commerce Backend API documentation detailing authentication, product management, order processing, Razorpay payment flows, and image uploads.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'JWT authentication token stored in httpOnly cookie'
        }
      }
    }
  },
  apis: ['./backend/routes/*.js', './backend/app.js']
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = app => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
