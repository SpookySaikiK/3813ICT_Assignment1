const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const fs = require('fs');
const path = require('path');
const { expect } = chai;
chai.use(chaiHttp);

describe('Avatar Upload Route', () => {
    before((done) => {
        chai.request(server)
            .post('/registerUser')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser@example.com'
            })
            .end((err, res) => {
                done();
            });
    });

    //Upload avatar
    describe('POST /uploadAvatar', () => {

        it('should upload an avatar for an existing user', (done) => {
            chai.request(server)
                .post('/uploadAvatar')
                .set('Content-Type', 'multipart/form-data')
                .field('username', 'testuser')
                .attach('avatar', fs.readFileSync(path.join(__dirname, 'test-avatar.png')), 'test-avatar.png')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').eql('Avatar uploaded successfully');
                    expect(res.body).to.have.property('avatarPath').that.includes('uploads/avatar/');
                    done();
                });
        });

        it('should return 404 if the user does not exist', (done) => {
            chai.request(server)
                .post('/uploadAvatar')
                .set('Content-Type', 'multipart/form-data')
                .field('username', 'nonexistentuser')
                .attach('avatar', fs.readFileSync(path.join(__dirname, 'test-avatar.png')), 'test-avatar.png')
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').eql('User not found');
                    done();
                });
        });

        it('should return 400 if username is missing', (done) => {
            chai.request(server)
                .post('/uploadAvatar')
                .set('Content-Type', 'multipart/form-data')
                .attach('avatar', fs.readFileSync(path.join(__dirname, 'test-avatar.png')), 'test-avatar.png')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('message').eql('Username is missing');
                    done();
                });
        });
    });
});
