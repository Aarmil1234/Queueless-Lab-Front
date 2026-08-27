import React, { useEffect } from 'react';

// const ApiCall = () => {
//     useEffect(() => {
//         fetch('https://medicare-mllp.onrender.com/medicare/', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//               name: 'Test Name'
//             })
//         })
//         .then(async (res) => {
//             if (!res.ok) {
//                 const text = await res.text(); // Read HTML if error
//                 throw new Error('Server Error: ' + text);
//             }
//             return res.json();
//         })
//         .then(data => console.log(data))
//         .catch(err => console.error('API Call Failed:', err.message));
//     }, []);

//     return (
//         <div>ApiCall</div>
//     );
// }

// export default ApiCall;
