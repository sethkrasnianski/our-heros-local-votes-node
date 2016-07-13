function present(haystack, needle) {
  return haystack.indexOf(needle) > -1;
}

function vote(pd, message) {
  return [pd.name, ...pd.aliases]
    .map((name) => {
      return present(message, name.toLowerCase());
    })
    .some((presence) => {
      return presence === true;
    });
}

module.exports = function(departments, comments) {
  const pds = departments.map((pd) => {
    const meta = {votes: 0};
    if (!pd.hasOwnProperty('aliases')) {
      Object.assign(meta, {aliases: []});
    }
    return Object.assign({}, pd, meta);
  });

  comments.forEach((comment) => {
    const message = comment.message.toLowerCase();

    pds.forEach((pd) => {
      if (vote(pd, message)) {
        pd.votes ++;
      }
    });
  });

  return pds;
};
