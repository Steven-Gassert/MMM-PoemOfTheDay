var { getPoem, filterByLanguage } = require("../node_helper");
var axios = require("axios");
var sinon = require("sinon");
require("dotenv").config();
jest.mock("../config");
jest.mock("detectlanguage");

describe("getPoem", () => {
	let axiosStub = sinon.stub();
	afterEach(() => {
		axiosStub.restore();
	});

	test("should call poemist api", (done) => {
		axiosStub = sinon.stub(axios, "get").returns(Promise.resolve({ data: [{ content: "mock content"}]}));
		getPoem()
			.then((poem) => {
				expect(axiosStub.calledWith("https://www.poemist.com/api/v1/randompoems")).toBe(true);
			})
			.then(done,done);
	});

	describe("when poemist api returns an error", () => {
		test("should catch the error and try to call the api again", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.reject("Im an error"));
			axiosStub.onSecondCall().returns(Promise.resolve({ data: [{ content: "mock content"}]}));
			getPoem()
				.then((poem) => {
					expect(axiosStub.callCount).toBe(2);
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are above config lineLimit", () => {
		test("calls the poemist api a second time", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "line 1 \n line 2 \n"}]}));
			axiosStub.onSecondCall().returns(Promise.resolve({ data: [{ content: "mock content"}]}));
			getPoem()
				.then((poem) => {
					expect(axiosStub.callCount).toBe(2);
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are below config lineLimit", () => {
		test("returns a poem", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "line 1 \n line 2"}]}));
			getPoem()
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
			getPoem()
				.then((poem) => {
					expect(axiosStub.callCount).toBe(2);
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are below config textLimit", () => {
		test("returns a poem", (done) => {
			axiosStub = sinon.stub(axios, "get").onFirstCall().returns(Promise.resolve({ data: [{ content: "below 20 chars"}]}));
			getPoem()
				.then((poem) => {
					expect(poem).toEqual({content: "below 20 chars"});
				})
				.then(done,done);
		});
	});

	describe("when poemist api returns poems that are not within config languageSet", () => {
		test("should return only the poems within the config languageSet", () => {
			let poems = [{ content: "will be detected as english" }, { content: "will be detected as spanish" }, { content: "will be detected as french" }];
			return filterByLanguage(poems).then((poems) => {
				expect(poems).toEqual([{ content: "will be detected as english" }, { content: "will be detected as spanish" }]);
			});
		});
	});
});
