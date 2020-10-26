import request from "supertest";
import app from "../src/app";
import { expect} from "chai";

describe("GET /moteefe", () => {
    it("should return 200 OK", (done) => {
        request(app).get("/moteefe")
            .expect(200, done);
    });
});

/* TODO: finish the test
describe("POST /moteefe", () => {
    it("should return false from assert when no region is found", (done) => {
        request(app).post("/moteefe")
            .field("", "")
            .end(function(err, res) {
                expect(res.error).to.be.false;
                done();
            })
            .expect(302);

    });
});
*/
