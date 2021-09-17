import React from 'react'

interface errorInterface {
    error : string
}

export default function Error(props:errorInterface) {
    return (
        <>
            {props.error}
        </>
    )
}
