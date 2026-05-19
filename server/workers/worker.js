import '../config/db.js';
import './image.worker.js';
import connectedDB from '../config/db.js';

connectedDB();

console.log('Worker process started and waiting for jobs...');
