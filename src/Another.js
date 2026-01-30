import React from 'react'

const Another = () => {
  return (
    <form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="image" />
  <button type="submit">Upload</button>
</form>

  )
}

export default Another