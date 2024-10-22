const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

describe('User Routes', () => {

    //Register user
    describe('POST /registerUser', () => {
        it('should register a new user', (done) => {
            chai.request(server)
                .post('/registerUser')
                .send({
                    username: 'testingUser',
                    password: 'testpassword',
                    email: 'testingUser@example.com'
                })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message').eql('User created successfully');
                    done();
                });
        });

        it('should not register an existing user', (done) => {
            chai.request(server)
                .post('/registerUser')
                .send({
                    username: 'testingUser',
                    password: 'testpassword',
                    email: 'testingUser@example.com'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('message').eql('User already exists');
                    done();
                });
        });
    });

    //Login user
    describe('POST /loginUser', () => {
        it('should log in an existing user', function (done) {
            this.timeout(10000);

            chai.request(server)
                .post('/loginUser')
                .send({
                    username: 'testingUser',
                    password: 'testpassword'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('username').eql('testingUser');
                    done();
                });
        });

        it('should return 401 for wrong password', function (done) {
            this.timeout(10000);

            chai.request(server)
                .post('/loginUser')
                .send({
                    username: 'testingUser',
                    password: 'wrongpassword'
                })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('message').eql('Invalid password');
                    done();
                });
        });
    });


    //Delete user route
    describe('DELETE /deleteUser/:username', () => {
        it('should delete an existing user', (done) => {
            chai.request(server)
                .delete('/deleteUser/testingUser')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').eql('User deleted successfully');
                    done();
                });
        });
    });
});
