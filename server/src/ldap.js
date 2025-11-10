import ldapjs from 'ldapjs';

const client = ldapjs.createClient({
  url: process.env.LDAP_URL || 'ldap://localhost:389'
});

export const authenticateLDAP = async (username, password) => {
  return new Promise((resolve, reject) => {
    const userDN = `uid=${username},${process.env.LDAP_BASE_DN || 'dc=example,dc=com'}`;

    client.bind(userDN, password, (err) => {
      if (err) {
        reject(new Error('LDAP authentication failed'));
      } else {
        client.search(
          process.env.LDAP_BASE_DN,
          { filter: `(uid=${username})`, scope: 'sub' },
          (searchErr, res) => {
            if (searchErr) {
              reject(searchErr);
              return;
            }

            const entries = [];
            res.on('searchEntry', (entry) => {
              entries.push(entry.pojo);
            });

            res.on('end', () => {
              if (entries.length === 0) {
                reject(new Error('User not found'));
              } else {
                const user = entries[0];
                resolve({
                  id: user.uid?.[0] || username,
                  username: username,
                  email: user.mail?.[0] || `${username}@example.com`,
                  displayName: user.displayName?.[0] || user.cn?.[0] || username
                });
              }
            });

            res.on('error', (err) => {
              reject(err);
            });
          }
        );
      }
    });
  });
};

export const unbindLDAP = () => {
  return new Promise((resolve, reject) => {
    client.unbind((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
