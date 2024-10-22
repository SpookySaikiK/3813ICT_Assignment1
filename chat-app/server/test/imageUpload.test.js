const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;
const path = require('path');
chai.use(chaiHttp);

describe('Image Upload Routes', () => {
  //No image uploaded
  it('should return 400 when no image is uploaded', (done) => {
    chai.request(server)
      .post('/uploadImage')
      .send({ username: 'testuser', channelId: 1 })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message').eql('No image file uploaded');
        done();
      });
  });

  //Upload image
  it('should upload an image successfully', (done) => {
    chai.request(server)
      .post('/uploadImage')
      .field('username', 'testuser')
      .field('channelId', 1)
      .attach('image', path.resolve(__dirname, 'test-image.png'))
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Image uploaded and message sent successfully');
        expect(res.body).to.have.property('image');
        done();
      });
  });
});
