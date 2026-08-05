export const musicInfo = {

    name: 'music',
    label: 'Music Streaming',
    description: 'Artists, albums, tracks, users, playlists, and play counts. Analyze rolling plays, churn detection, and collaborative filtering.',
    icon: '🎵',
    tableCount: 7,
    questionCount: 60,
    concepts: ['Rolling Play Counts', 'Churn Detection', 'Collaborative Filtering'],
    tables: [
      {
        "name": "artists",
        "rowCount": 50,
        "columns": [
          {
            "name": "artist_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "genre",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "formed_year",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "albums",
        "rowCount": 100,
        "columns": [
          {
            "name": "album_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "artist_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "artists",
            "isNullable": true
          },
          {
            "name": "release_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "genre",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "tracks",
        "rowCount": 400,
        "columns": [
          {
            "name": "track_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "album_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "albums",
            "isNullable": true
          },
          {
            "name": "duration_secs",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "bpm",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "track_number",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "users",
        "rowCount": 100,
        "columns": [
          {
            "name": "user_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "username",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "joined_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "plays",
        "rowCount": 2000,
        "columns": [
          {
            "name": "play_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "user_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "users",
            "isNullable": true
          },
          {
            "name": "track_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "tracks",
            "isNullable": true
          },
          {
            "name": "played_at",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "play_duration_secs",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "playlists",
        "rowCount": 80,
        "columns": [
          {
            "name": "playlist_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "user_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "users",
            "isNullable": true
          },
          {
            "name": "created_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "is_public",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "playlist_tracks",
        "rowCount": 500,
        "columns": [
          {
            "name": "id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "playlist_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "playlists",
            "isNullable": true
          },
          {
            "name": "track_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "tracks",
            "isNullable": true
          },
          {
            "name": "added_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "position",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      }
    ]

};
