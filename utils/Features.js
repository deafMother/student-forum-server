/* 
  function to implement sorting
*/

exports.sortPosts = query => {
  query.sort("-postedOn"); //-ve means latest posted post first
};

/* 
  implementing pagination
*/

exports.paginationPosts = (query, req) => {
  let pageNumber = req.query.pageNumber * 1 || 1;
  let pageLimit = 5;
  let skip = (pageNumber - 1) * pageLimit;
  query.skip(skip).limit(pageLimit);
};

/* function to filter posts by category*/

exports.filter = (query, req) => {
  let fields = ["I", "II", "III", "IV", "V", "VI", "General"];
  if (fields.includes(req.query.filter)) {
    query.find({ category: req.query.filter }).populate("postedBy");
  } else {
    query.find().populate("postedBy");
  }
};
