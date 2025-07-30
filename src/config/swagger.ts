import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export const swaggerSetup = (app: Express) => {
  try {
    const swaggerDocument = YAML.load(path.join(process.cwd(), 'swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (error) {
    console.warn('No se pudo cargar la documentación Swagger');
  }
};