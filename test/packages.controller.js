import { expect } from 'chai';
import request from 'supertest';
import Server from '../server/index.js';

describe('Packages Controller', () => {
  describe('GET /packages', () => {
    it('should return packages with default pagination', () =>
      request(Server)
        .get('/api/v1/packages')
        .expect('Content-Type', /json/)
        .then((r) => {
          expect(r.body).to.be.an('array');
          expect(r.body.length).to.be.lessThanOrEqual(20); // default limit
        }));

    it('should accept custom limit and offset', () =>
      request(Server)
        .get('/api/v1/packages?limit=5&offset=10')
        .expect('Content-Type', /json/)
        .then((r) => {
          expect(r.body).to.be.an('array');
          expect(r.body.length).to.be.lessThanOrEqual(5);
        }));

    it('should handle comma-separated tags', () =>
      request(Server)
        .get('/api/v1/packages?tags=node,express')
        .expect('Content-Type', /json/)
        .then((r) => {
          expect(r.body).to.be.an('array');
        }));

    it('should handle empty tags parameter', () =>
      request(Server)
        .get('/api/v1/packages?tags=')
        .expect('Content-Type', /json/)
        .then((r) => {
          expect(r.body).to.be.an('array');
        }));

    it('should handle deprecated flag', () =>
      request(Server)
        .get('/api/v1/packages?deprecated=true')
        .expect('Content-Type', /json/)
        .then((r) => {
          expect(r.body).to.be.an('array');
        }));

    it('should validate limit parameter', () =>
      request(Server)
        .get('/api/v1/packages?limit=invalid')
        .expect(422)
        .then((r) => {
          expect(r.body.errors).to.be.an('array');
          expect(r.body.errors[0]).to.have.property('param', 'limit');
        }));

    it('should validate tags parameter format', () =>
      request(Server)
        .get('/api/v1/packages?tags=node,')
        .expect(422)
        .then((r) => {
          expect(r.body.errors).to.be.an('array');
          expect(r.body.errors[0]).to.have.property('param', 'tags');
        }));
  });
});
