@@ -0,0 +1,47 @@
from flask import Flask, render_template, request, jsonify
import pickle
import requests

app = Flask(__name__)

movies = pickle.load(open('movie_list.pkl', 'rb'))
similarity = pickle.load(open('similarity.pkl', 'rb'))

def fetch_poster(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=8265bd1679663a7ea12ac168da84d2e8"
    data = requests.get(url).json()
    return "https://image.tmdb.org/t/p/w500/" + data['poster_path']

@app.route('/')
def index():
    return render_template(
        'index.html',
        movies=list(movies['title'].values)
    )

@app.route('/recommend', methods=['POST'])
def recommend():
    movie = request.json.get('movie')

    if movie not in movies['title'].values:
        return jsonify({'error': 'Movie not found'})

    index = movies[movies['title'] == movie].index[0]
    distances = sorted(
        list(enumerate(similarity[index])),
        reverse=True,
        key=lambda x: x[1]
    )[1:6]

    recommendations = []
    for i in distances:
        movie_id = movies.iloc[i[0]].movie_id
        recommendations.append({
            'title': movies.iloc[i[0]].title,
            'poster': fetch_poster(movie_id)
        })

    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(debug=True)
