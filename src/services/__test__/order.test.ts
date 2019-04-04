import moment from 'moment'
import {getData} from "../order";

var since = moment().startOf('day').subtract(1, 'days').format()
// since.toStrin

// describe("This is a simple test", () => {
//     test("Check the sampleFunction function", () => {
//         expect(sampleFunction("hello")).toEqual("hellohello");
//     });
// });

describe("Test order services", () => {
    it("Test since and util is not empty", async () => {
        // expect.assertions(1)
        try {
            await getData({
                since: new Date(),
                util: '',
            })

        } catch (err) {
            console.log(err)
            expect(err).toMatchObject({

            })
        }
    });
});

