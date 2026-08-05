export const sportsInfo = {

    name: 'sports',
    label: 'Sports League',
    description: 'Teams, players, matches, goals, seasons, and standings. Build dynamic league tables, form tables, and rolling stats.',
    icon: '⚽',
    tableCount: 6,
    questionCount: 60,
    concepts: ['League Table', 'Top Scorers', 'Form Table', 'Rolling Stats'],
    tables: [
      {
        "name": "seasons",
        "rowCount": 5,
        "columns": [
          {
            "name": "season_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "teams",
        "rowCount": 20,
        "columns": [
          {
            "name": "team_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "founded_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "division",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "players",
        "rowCount": 200,
        "columns": [
          {
            "name": "player_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "position",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "dob",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "nationality",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "matches",
        "rowCount": 150,
        "columns": [
          {
            "name": "match_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "home_team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "away_team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "match_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "season_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "seasons",
            "isNullable": true
          },
          {
            "name": "home_score",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "away_score",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "matchday",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "goals",
        "rowCount": 400,
        "columns": [
          {
            "name": "goal_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "match_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "matches",
            "isNullable": true
          },
          {
            "name": "player_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "players",
            "isNullable": true
          },
          {
            "name": "minute",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "is_own_goal",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "standings",
        "rowCount": 100,
        "columns": [
          {
            "name": "standing_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "season_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "seasons",
            "isNullable": true
          },
          {
            "name": "team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "played",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "won",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "drawn",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "lost",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "points",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      }
    ]

};
