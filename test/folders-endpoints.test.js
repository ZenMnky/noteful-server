const knex = require('knex')
const supertest = require('supertest')
const {makeFoldersArray} = require('./folders.fixtures')
const app = require('../src/app')
const { expect } = require('chai')

describe('Folders endpoints', () => {
    let db

    before(`make knex instance`, () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after(`disconnect from db`, () => db.destroy() )

    before(`clean table`, () => {
        return db
        .raw('TRUNCATE TABLE folders, notes RESTART IDENTITY CASCADE')
    })

    afterEach(`clean table`, () => {
        return db
            .raw('TRUNCATE TABLE folders, notes RESTART IDENTITY CASCADE')
    })

    describe(`GET /api/folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })

        })

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray()
            
            beforeEach('insert folders', () => {
                return db                    
                    .into('folders')
                    .insert(testFolders)
            })
            
            it(`responds wtih 200 and the expected folders`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })
        })
    })
    describe(`GET /api/folders/:folder_id`, () => {
        const testFolders = makeFoldersArray()
            
        beforeEach('insert folders', () => {
            return db                    
                .into('folders')
                .insert(testFolders)
        })
        
        it(`responds with 200`, () => {
            const folderId = 2
            return supertest(app)
                .get(`/api/folders/${folderId}`)
                .expect(200)
        })
    })
    describe(`POST /api/folders`, () => {
        it(`responds with 201 when folder is added and returns new folder and id`, () => {

            const newFolder = {
                folder_name: 'New test folder'
            }

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                })
                // .then(response => {
                //     supertest(app)
                //         .get(`/api/folder/${response.body.id}`)
                //         .expect(response.body)
                // })
                
        })
    })

    describe(`DELETE /api/folders/:folder_id`, () => {
        const testFolders = makeFoldersArray()
            
        beforeEach('insert folders', () => {
            return db                    
                .into('folders')
                .insert(testFolders)
        })
        
        it(`Responds with 204`, () => {
            return supertest(app)
                .delete('/api/folders/2')
                .expect(204)

        })
    })

})
