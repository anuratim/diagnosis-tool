describe('helpers', function () {
  describe('zeroToMax', function () {
    it('should correctly find the domain', function () {
      helpers.zeroToMax([
        { value: 15 },
        { value: 2011 },
        { value: 95 },
        { value: 47 },
        { value: 2013 },
        { value: 12 }
      ]).should.eql([0, 2013]);
    });
  });
});
