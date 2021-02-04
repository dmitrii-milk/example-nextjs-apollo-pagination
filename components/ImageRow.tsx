import React, { useCallback } from 'react';
import Image from 'react-bootstrap/Image';
import { Photo } from '../pages/index';

type ImageRowProps = {
  photo: Photo;
  onSelect: (photo: Photo) => void;
};

function ImageRow({ photo, onSelect }: ImageRowProps) {
  const handleClick = useCallback(() => onSelect(photo), [onSelect, photo]);

  return (
    <tr onClick={handleClick}>
      <td>{photo.id}</td>
      <td>{photo.title}</td>
      <td>
        <Image src={photo.thumbnailUrl} rounded fluid />
      </td>
    </tr>
  );
}

export default ImageRow;
