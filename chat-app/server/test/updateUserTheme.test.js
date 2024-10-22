const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;
chai.use(chaiHttp);

describe('Update User Theme Route', () => {
    //Updating a users theme
    describe('PUT /updateUserTheme', () => {

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

        it('should update the theme for an existing user', (done) => {
            chai.request(server)
                .put('/updateUserTheme')
                .send({
                    username: 'testuser',
                    theme: 'dark'
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message').eql('Theme updated successfully');
                    done();
                });
        });

        it('should return 404 if the user does not exist', (done) => {
            chai.request(server)
                .put('/updateUserTheme')
                .send({
                    username: 'nonexistentuser',
                    theme: 'dark'
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message').eql('User not found');
                    done();
                });
        });
    });
});
