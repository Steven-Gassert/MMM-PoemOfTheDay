const { getPoem, filterByLanguage } = require("../node_helper");
const axios = require("axios");

const sinon = require("sinon");
jest.mock("detectlanguage");

const CONFIG =  {
	title: "Loading ...",
	content: "",
	name: "",
	textLimit: 20,
	lineLimit: 1,
	detectLanguageApiKey: "fake api key",
	// for a full list of supported languages see https://ws.detectlanguage.com/0.2/languages
	languageSet: ["en", "es"],
	updateInterval: 1000
};

describe("getPoem", () => {
	let axiosStub;
	beforeEach(() => {
		axiosStub = sinon.stub();
	});
	afterEach(() => {
		axiosStub.restore();
	});

	test("should call poemist api", (done) => {
		axiosStub = sinon.stub(axios, "get").returns(Promise.resolve({ data: [{ content: "mock content"}]}));
		getPoem(CONFIG)
			.then((poem) => {
				expect(axiosStub.calledWith("https://www.poemist.com/api/v1/randompoems")).toBe(true);
			})
			.then(done,done);
	});

	// TODO fix this test, see https://stackoverflow.com/questions/59400124/jest-timer-mocks-do-not-allow-my-test-to-unblock
	// describe("when poemist api returns an error", () => {
	// 	test.only("should sleep for 5 mins", (done) => {
	// 		axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.reject("Im an error"));
	// 		jest.useFakeTimers(); // mocks setTimeOut
	// 		getPoem(CONFIG)
	// 			.then((poem) => {
	// 				console.log("returned from calling getPoem");
	// 				expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
	// 			})
	// 			.then(done,done);
	// 		jest.advanceTimersByTime(2000);
	// 	});
	// });

	describe("when poemist api returns poems that are above config lineLimit", () => {
		test("calls the poemist api a second time", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "line 1 \n line 2 \n"}]}));
			axiosStub.onSecondCall().returns(Promise.resolve({ data: [{ content: "mock content"}]}));
			getPoem(CONFIG)
				.then((poem) => {
					expect(axiosStub.callCount).toBe(2);
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are below config lineLimit", () => {
		test("returns a poem", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "line 1 \n line 2"}]}));
			getPoem(CONFIG)
				.then((poem) => {
					expect(poem).toEqual({content: "line 1 \n line 2"});
				})
				.then(done, done);
		});
	});

	describe("when poemist api returns poems that are above config textLimit", () => {
		test("calls the poemist api a second time", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "this text is above 20 characters"}]}));
			axiosStub.onSecondCall().returns(Promise.resolve({ data: [{ content: "mock content"}]}));
			getPoem(CONFIG)
				.then((poem) => {
					expect(axiosStub.callCount).toBe(2);
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are below config textLimit", () => {
		test("returns a poem", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "below 20 chars"}]}));
			getPoem(CONFIG)
				.then((poem) => {
					expect(poem).toEqual({content: "below 20 chars"});
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are not within config languageSet", () => {
		test("should return only the poems within the config languageSet", () => {
			let poems = [{ content: "will be detected as english" }, { content: "will be detected as spanish" }, { content: "will be detected as french" }];
			return filterByLanguage(poems, CONFIG).then((poems) => {
				expect(poems).toEqual([{ content: "will be detected as english" }, { content: "will be detected as spanish" }]);
			});
		});
	});
});

// TODO: add a test for when detectLanguage API call fails
// TODO: add update interval tests
